package com.maihuuphuoc.example05.service;

import com.maihuuphuoc.example05.payloads.ContactDTO;
import com.maihuuphuoc.example05.payloads.ContactResponse;

public interface ContactService {
    ContactDTO createContact(ContactDTO contactDTO);
    ContactDTO getContactById(Long id);
    ContactResponse getAllContacts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    ContactDTO updateContactStatus(Long id, String status);
}