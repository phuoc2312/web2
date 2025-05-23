package com.maihuuphuoc.example05.controller;

import com.maihuuphuoc.example05.config.AppConstants;
import com.maihuuphuoc.example05.payloads.ContactDTO;
import com.maihuuphuoc.example05.payloads.ContactResponse;
import com.maihuuphuoc.example05.service.ContactService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/public/contacts")
    public ResponseEntity<ContactDTO> createContact(@RequestBody ContactDTO dto) {
        ContactDTO savedContactDTO = contactService.createContact(dto);
        return new ResponseEntity<>(savedContactDTO, HttpStatus.CREATED);
    }

    @GetMapping("/public/contacts")
    public ResponseEntity<ContactResponse> getAllContacts(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "contactId", required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        ContactResponse contactResponse = contactService.getAllContacts(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(contactResponse, HttpStatus.OK);
    }

    @GetMapping("/public/contacts/{id}")
    public ResponseEntity<ContactDTO> getContactById(@PathVariable Long id) {
        ContactDTO contactDTO = contactService.getContactById(id);
        return new ResponseEntity<>(contactDTO, HttpStatus.OK);
    }

    @DeleteMapping("/admin/contacts/{id}")
    public ResponseEntity<String> deleteContact(@PathVariable Long id) {
        String status = contactService.deleteContact(id);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }

    @PutMapping("/admin/contacts/{id}")
    public ResponseEntity<ContactDTO> updateContact(@PathVariable Long id, @RequestBody ContactDTO dto) {
        ContactDTO updatedContactDTO = contactService.updateContact(id, dto);
        return new ResponseEntity<>(updatedContactDTO, HttpStatus.OK);
    }
}