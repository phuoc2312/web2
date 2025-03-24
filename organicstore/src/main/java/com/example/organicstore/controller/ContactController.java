package com.example.organicstore.controller;

import com.example.organicstore.dto.request.ContactRequest;
import com.example.organicstore.dto.response.ContactResponse;
import com.example.organicstore.dto.response.MessageResponse;
import com.example.organicstore.dto.response.PagedResponse;
import com.example.organicstore.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/contact")
public class ContactController {
    @Autowired
    private ContactService contactService;

    @PostMapping
    public ResponseEntity<MessageResponse> submitContactForm(@Valid @RequestBody ContactRequest contactRequest) {
        contactService.submitContactForm(contactRequest);
        return ResponseEntity.ok(new MessageResponse("Contact message sent successfully"));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<ContactResponse>> getAllContactMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ContactResponse> contacts = contactService.getAllContactMessages(page, size);
        return ResponseEntity.ok(contacts);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactResponse> getContactMessageById(@PathVariable Long id) {
        ContactResponse contact = contactService.getContactMessageById(id);
        return ResponseEntity.ok(contact);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteContactMessage(@PathVariable Long id) {
        contactService.deleteContactMessage(id);
        return ResponseEntity.ok(new MessageResponse("Contact message deleted successfully"));
    }
}