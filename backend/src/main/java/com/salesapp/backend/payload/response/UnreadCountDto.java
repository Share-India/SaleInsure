package com.salesapp.backend.payload.response;

public class UnreadCountDto {
    private Long senderId;
    private Long count;

    public UnreadCountDto(Long senderId, Long count) {
        this.senderId = senderId;
        this.count = count;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
