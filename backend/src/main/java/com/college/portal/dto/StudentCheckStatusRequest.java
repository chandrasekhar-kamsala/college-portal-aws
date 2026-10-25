package com.college.portal.dto;

import jakarta.validation.constraints.NotBlank;

public class StudentCheckStatusRequest {

    @NotBlank(message = "College register number is required")
    private String registerNumber;

    public StudentCheckStatusRequest() {
    }

    public StudentCheckStatusRequest(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }
}
