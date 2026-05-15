package com.salesapp.backend.payload.response;

import java.util.Map;

public class UnreadSummaryResponse {
    private Long totalUnread;
    private Map<Long, Long> perUserCounts;

    public UnreadSummaryResponse(Long totalUnread, Map<Long, Long> perUserCounts) {
        this.totalUnread = totalUnread;
        this.perUserCounts = perUserCounts;
    }

    public Long getTotalUnread() {
        return totalUnread;
    }

    public void setTotalUnread(Long totalUnread) {
        this.totalUnread = totalUnread;
    }

    public Map<Long, Long> getPerUserCounts() {
        return perUserCounts;
    }

    public void setPerUserCounts(Map<Long, Long> perUserCounts) {
        this.perUserCounts = perUserCounts;
    }
}
