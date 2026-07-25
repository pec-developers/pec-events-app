package com.pecdevelopers.events.model.enums;

public enum SystemConfigKey {
    MAX_SPOCS_PER_DEPT(1, "Maximum SPOCs allowed per department"),
    MAX_FACULTY_COORDINATORS_PER_DEPT(3, "Maximum Faculty Coordinators allowed per department"),
    MAX_STUDENT_COORDINATORS_PER_DEPT(3, "Maximum Student Coordinators allowed per department");

    private final int defaultValue;
    private final String description;

    SystemConfigKey(int defaultValue, String description) {
        this.defaultValue = defaultValue;
        this.description = description;
    }

    public int getDefaultValue() {
        return defaultValue;
    }

    public String getDescription() {
        return description;
    }
}
