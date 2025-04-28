package com.maihuuphuoc.example05.controller;

import com.maihuuphuoc.example05.payloads.ContactDTO;
import com.maihuuphuoc.example05.payloads.ContactResponse;
import com.maihuuphuoc.example05.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ContactController {
    @Autowired
    private ContactService contactService;

    @PostMapping("/public/contacts")
    public ResponseEntity<ContactDTO> createContact(@RequestBody ContactDTO contactDTO) {
        return ResponseEntity.ok(contactService.createContact(contactDTO));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/contacts/{id}")
    public ResponseEntity<ContactDTO> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/contacts")
    public ResponseEntity<ContactResponse> getAllContacts(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        return ResponseEntity.ok(contactService.getAllContacts(pageNumber, pageSize, sortBy, sortOrder));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/contacts/{id}/status")
    public ResponseEntity<ContactDTO> updateContactStatus(@PathVariable Long id, @RequestBody String status) {
        return ResponseEntity.ok(contactService.updateContactStatus(id, status));
    }
}