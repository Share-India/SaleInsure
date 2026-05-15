package com.salesapp.backend.payload.request;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private String role; // SALESPERSON or MANAGER
    private String designation;
}
