package com.example.organicstore.service;

import com.example.organicstore.dto.request.ContactRequest;
import com.example.organicstore.dto.response.ContactResponse;
import com.example.organicstore.dto.response.PagedResponse;
import com.example.organicstore.exception.ResourceNotFoundException;
import com.example.organicstore.model.Contact;
import com.example.organicstore.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {
    @Autowired
    private ContactRepository contactRepository;
    
    @Autowired
    private UserService userService;

    @Transactional
    public void submitContactForm(ContactRequest contactRequest) {
        Contact contact = new Contact();
        contact.setName(contactRequest.getName());
        contact.setEmail(contactRequest.getEmail());
        contact.setPhone(contactRequest.getPhone());
        contact.setSubject(contactRequest.getSubject());
        contact.setMessage(contactRequest.getMessage());
        
        contactRepository.save(contact);
    }
    
    public PagedResponse<ContactResponse> getAllContactMessages(int page, int size) {
        // Only admin can view contact messages
        if (!userService.isCurrentUserAdmin()) {
            throw new RuntimeException("You are not authorized to view contact messages");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Contact> contacts = contactRepository.findAll(pageable);
        
        List<ContactResponse> content = contacts.getContent().stream()
                .map(this::mapToContactResponse)
                .collect(Collectors.toList());
        
        return new PagedResponse<>(
                content,
                contacts.getNumber(),
                contacts.getSize(),
                contacts.getTotalElements(),
                contacts.getTotalPages(),
                contacts.isLast()
        );
    }
    
    public ContactResponse getContactMessageById(Long id) {
        // Only admin can view contact messages
        if (!userService.isCurrentUserAdmin()) {
            throw new RuntimeException("You are not authorized to view contact messages");
        }
        
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message not found with id: " + id));
        
        return mapToContactResponse(contact);
    }
    
    @Transactional
    public void deleteContactMessage(Long id) {
        // Only admin can delete contact messages
        if (!userService.isCurrentUserAdmin()) {
            throw new RuntimeException("You are not authorized to delete contact messages");
        }
        
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message not found with id: " + id));
        
        contactRepository.delete(contact);
    }
    
    private ContactResponse mapToContactResponse(Contact contact) {
        ContactResponse response = new ContactResponse();
        response.setId(contact.getId());
        response.setName(contact.getName());
        response.setEmail(contact.getEmail());
        response.setPhone(contact.getPhone());
        response.setSubject(contact.getSubject());
        response.setMessage(contact.getMessage());
        response.setCreatedAt(contact.getCreatedAt());
        
        return response;
    }
}