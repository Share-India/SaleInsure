package com.salesapp.backend.controllers;

import com.salesapp.backend.models.Message;
import com.salesapp.backend.models.User;
import com.salesapp.backend.payload.response.MessageDto;
import com.salesapp.backend.payload.response.MessageResponse;
import com.salesapp.backend.payload.response.UnreadCountDto;
import com.salesapp.backend.payload.response.UnreadSummaryResponse;
import com.salesapp.backend.repository.MessageRepository;
import com.salesapp.backend.repository.UserRepository;
import com.salesapp.backend.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageDto request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long senderId = userDetails.getId();

        if (request.getReceiverId() == null || request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Receiver ID and content are required!"));
        }

        User receiver = userRepository.findById(request.getReceiverId()).orElse(null);
        if (receiver == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Receiver not found!"));
        }

        Message message = new Message(senderId, request.getReceiverId(), request.getContent(), LocalDateTime.now());
        messageRepository.save(message);

        return ResponseEntity.ok(new MessageResponse("Message sent successfully!"));
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<?> getConversation(@PathVariable Long otherUserId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long currentUserId = userDetails.getId();

        List<Message> messages = messageRepository.findConversation(currentUserId, otherUserId);

        List<MessageDto> dtoList = messages.stream().map(m -> {
            User sender = userRepository.findById(m.getSenderId()).orElse(null);
            User receiver = userRepository.findById(m.getReceiverId()).orElse(null);
            return new MessageDto(
                    m.getId(),
                    m.getSenderId(),
                    sender != null ? sender.getUsername() : "Unknown",
                    m.getReceiverId(),
                    receiver != null ? receiver.getUsername() : "Unknown",
                    m.getContent(),
                    m.getTimestamp(),
                    m.getIsRead()
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadSummary() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long currentUserId = userDetails.getId();

        long totalUnread = messageRepository.countByReceiverIdAndIsReadFalse(currentUserId);
        List<UnreadCountDto> unreadCounts = messageRepository.getUnreadCountsGroupedBySender(currentUserId);

        Map<Long, Long> perUserCounts = unreadCounts.stream()
                .collect(Collectors.toMap(UnreadCountDto::getSenderId, UnreadCountDto::getCount));

        return ResponseEntity.ok(new UnreadSummaryResponse(totalUnread, perUserCounts));
    }

    @PutMapping("/read/{senderId}")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable Long senderId) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long currentUserId = userDetails.getId();

        messageRepository.markMessagesAsRead(senderId, currentUserId);

        return ResponseEntity.ok(new MessageResponse("Messages marked as read"));
    }
}
