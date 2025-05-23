package com.maihuuphuoc.example05.service;

import com.maihuuphuoc.example05.payloads.ContactDTO;
import com.maihuuphuoc.example05.payloads.ContactResponse;
import java.util.List;

public interface ContactService {
    ContactDTO createContact(ContactDTO dto);
    ContactResponse getAllContacts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    ContactDTO getContactById(Long id);
    String deleteContact(Long id);
    ContactDTO updateContact(Long id, ContactDTO dto);
}