package com.salesapp.backend.repository;

import com.salesapp.backend.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import com.salesapp.backend.payload.response.UnreadCountDto;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.senderId = :user1 AND m.receiverId = :user2) OR (m.senderId = :user2 AND m.receiverId = :user1) ORDER BY m.timestamp ASC")
    List<Message> findConversation(@Param("user1") Long user1, @Param("user2") Long user2);

    long countByReceiverIdAndIsReadFalse(Long receiverId);

    @Query("SELECT new com.salesapp.backend.payload.response.UnreadCountDto(m.senderId, COUNT(m)) FROM Message m WHERE m.receiverId = :receiverId AND m.isRead = false GROUP BY m.senderId")
    List<UnreadCountDto> getUnreadCountsGroupedBySender(@Param("receiverId") Long receiverId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.senderId = :senderId AND m.receiverId = :receiverId AND m.isRead = false")
    void markMessagesAsRead(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}
