package com.salesapp.backend.payload.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RevenueProgressDto {
    private double target;
    private double achieved;
    private double gap;
    private List<Double> weeklyData; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}
