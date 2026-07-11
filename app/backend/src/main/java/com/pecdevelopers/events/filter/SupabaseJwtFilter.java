package com.pecdevelopers.events.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SupabaseJwtFilter extends OncePerRequestFilter {

    private final SupabaseProperties supabaseProperties;
    private final ConcurrentHashMap<String, java.security.PublicKey> jwksCache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SupabaseJwtFilter(SupabaseProperties supabaseProperties) {
        this.supabaseProperties = supabaseProperties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") || 
               path.equals("/health") || 
               path.equals("/error") || 
               path.startsWith("/v3/api-docs") || 
               path.startsWith("/swagger-ui");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String token = null;
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null) {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("authToken".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
        }

        if (token == null) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT format");
            }
            String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            Map<?, ?> header = objectMapper.readValue(headerJson, Map.class);
            String alg = (String) header.get("alg");

            Claims claims;
            if ("ES256".equals(alg)) {
                String kid = (String) header.get("kid");
                java.security.PublicKey publicKey = getPublicKey(kid);
                claims = Jwts.parser()
                        .verifyWith(publicKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            } else {
                SecretKey key = Keys.hmacShaKeyFor(supabaseProperties.getJwtSecret().getBytes(StandardCharsets.UTF_8));
                claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            }

            String userId = claims.getSubject();
            String email = claims.get("email", String.class);
            String phone = claims.get("phone", String.class);

            request.setAttribute("userId", userId);
            request.setAttribute("email", email);
            request.setAttribute("phone", phone);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userId, null, List.of());
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token: " + e.getMessage());
            return;
        }

        chain.doFilter(request, response);
    }

    private java.security.PublicKey getPublicKey(String kid) throws Exception {
        if (kid == null) {
            throw new IllegalArgumentException("kid must not be null for asymmetric signature verification");
        }
        java.security.PublicKey cachedKey = jwksCache.get(kid);
        if (cachedKey != null) {
            return cachedKey;
        }

        String jwksUrl = supabaseProperties.getUrl() + "/auth/v1/.well-known/jwks.json";
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(jwksUrl))
                .GET()
                .build();

        java.net.http.HttpResponse<String> httpResponse = client.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString());
        if (httpResponse.statusCode() != 200) {
            throw new RuntimeException("Failed to fetch JWKS from " + jwksUrl + ", status: " + httpResponse.statusCode());
        }

        Map<?, ?> jwks = objectMapper.readValue(httpResponse.body(), Map.class);
        List<?> keys = (List<?>) jwks.get("keys");
        if (keys != null) {
            for (Object keyObj : keys) {
                if (keyObj instanceof Map<?, ?> keyMap) {
                    String keyId = (String) keyMap.get("kid");
                    if (kid.equals(keyId)) {
                        String kty = (String) keyMap.get("kty");
                        String crv = (String) keyMap.get("crv");
                        if ("EC".equals(kty) && "P-256".equals(crv)) {
                            String xStr = (String) keyMap.get("x");
                            String yStr = (String) keyMap.get("y");

                            byte[] xBytes = Base64.getUrlDecoder().decode(xStr);
                            byte[] yBytes = Base64.getUrlDecoder().decode(yStr);
                            java.math.BigInteger x = new java.math.BigInteger(1, xBytes);
                            java.math.BigInteger y = new java.math.BigInteger(1, yBytes);

                            java.security.AlgorithmParameters params = java.security.AlgorithmParameters.getInstance("EC");
                            params.init(new java.security.spec.ECGenParameterSpec("secp256r1"));
                            java.security.spec.ECParameterSpec ecParameters = params.getParameterSpec(java.security.spec.ECParameterSpec.class);

                            java.security.spec.ECPoint point = new java.security.spec.ECPoint(x, y);
                            java.security.spec.ECPublicKeySpec pubKeySpec = new java.security.spec.ECPublicKeySpec(point, ecParameters);
                            java.security.KeyFactory kf = java.security.KeyFactory.getInstance("EC");
                            java.security.PublicKey publicKey = kf.generatePublic(pubKeySpec);

                            jwksCache.put(kid, publicKey);
                            return publicKey;
                        }
                    }
                }
            }
        }
        throw new RuntimeException("Public key not found in JWKS for kid: " + kid);
    }
}
