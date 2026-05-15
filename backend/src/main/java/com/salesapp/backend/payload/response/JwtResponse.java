package com.salesapp.backend.payload.response;

import lombok.Data;
import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String profilePhotoUrl;
    private String designation;
    private List<String> roles;

    public JwtResponse(String accessToken, Long id, String username, String profilePhotoUrl, String designation, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.profilePhotoUrl = profilePhotoUrl;
        this.designation = designation;
        this.roles = roles;
    }
}
