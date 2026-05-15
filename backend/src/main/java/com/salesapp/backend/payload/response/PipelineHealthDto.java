package com.salesapp.backend.payload.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PipelineHealthDto {
    private long leads; // Alternatively Conversations
    private long meetings; // Connections
    private long offers; // Optional or mapped from somewhere else
    private long closed;
}
