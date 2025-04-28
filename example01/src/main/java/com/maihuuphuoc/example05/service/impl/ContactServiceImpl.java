package com.maihuuphuoc.example05.service.impl;

import com.maihuuphuoc.example05.entity.Contact;
import com.maihuuphuoc.example05.entity.Contact.ContactStatus;
import com.maihuuphuoc.example05.exceptions.APIException;
import com.maihuuphuoc.example05.exceptions.ResourceNotFoundException;
import com.maihuuphuoc.example05.payloads.ContactDTO;
import com.maihuuphuoc.example05.payloads.ContactResponse;
import com.maihuuphuoc.example05.repository.ContactRepo;
import com.maihuuphuoc.example05.service.ContactService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactServiceImpl implements ContactService {
    @Autowired
    private ContactRepo contactRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ContactDTO createContact(ContactDTO contactDTO) {
        Contact contact = modelMapper.map(contactDTO, Contact.class);
        Contact savedContact = contactRepo.save(contact);
        return modelMapper.map(savedContact, ContactDTO.class);
    }

    @Override
    public ContactDTO getContactById(Long id) {
        Contact contact = contactRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        return modelMapper.map(contact, ContactDTO.class);
    }

    @Override
    public ContactResponse getAllContacts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Contact> contactPage = contactRepo.findAll(pageable);
        List<ContactDTO> contactDTOs = contactPage.getContent().stream()
                .map(contact -> modelMapper.map(contact, ContactDTO.class))
                .collect(Collectors.toList());
        return new ContactResponse(
                contactDTOs,
                contactPage.getNumber(),
                contactPage.getSize(),
                contactPage.getTotalElements(),
                contactPage.getTotalPages(),
                contactPage.isLast()
        );
    }

    @Override
    public ContactDTO updateContactStatus(Long id, String status) {
        Contact contact = contactRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        try {
            contact.setStatus(ContactStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new APIException("Invalid status: " + status);
        }
        Contact updatedContact = contactRepo.save(contact);
        return modelMapper.map(updatedContact, ContactDTO.class);
    }
}