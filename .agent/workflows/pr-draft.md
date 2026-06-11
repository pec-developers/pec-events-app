---
description: GitHub PR Draft Generator
---

Generate a Pull Request description draft comparing the current branch to a target branch.

You should ask the user what the target branch is (e.g. `main` or `dev`) if they haven't provided it, or check if `main` or `dev` exists in the local repository and default to it (prompting the user if unsure).

To construct the draft:
1. Determine the current branch name using `git branch --show-current`.
2. Retrieve the list of commit messages between the target branch and the current branch:
   `git log <target_branch>..HEAD --oneline`
3. Retrieve the diff summary:
   `git diff <target_branch>..HEAD --stat`
4. Based on the commits and diff, generate a structured Pull Request draft including:
   - A clear title: `[Type] Brief description (e.g., feat: add OAuth2 login)`
   - An **Overview** of the PR.
   - **Key Changes** as a bulleted list.
   - **Why** the changes were made.
   - **Type of Change** checkboxes (e.g., Bug fix, New feature, Refactoring, Breaking change).
   - **Verification/Testing** details.

- Never create or submit the pull request.
- Just output the draft in a markdown code block.
