package com.college.portal.dto;

import jakarta.validation.constraints.NotBlank;

public class StudentLoginRequest {

    @NotBlank(message = "College register number is required")
    private String registerNumber;

    @NotBlank(message = "Password is required")
    private String password;

    public StudentLoginRequest() {
    }

    public StudentLoginRequest(String registerNumber, String password) {
        this.registerNumber = registerNumber;
        this.password = password;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
