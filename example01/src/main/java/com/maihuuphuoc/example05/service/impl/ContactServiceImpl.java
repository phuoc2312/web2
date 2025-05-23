package com.maihuuphuoc.example05.service.impl;

import com.maihuuphuoc.example05.entity.Contact;
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
    public ContactDTO createContact(ContactDTO dto) {
        // Kiểm tra trùng email (tùy chọn, để đồng bộ với Category và Blog)
        if (contactRepo.findByEmail(dto.getEmail()).isPresent()) {
            throw new APIException("Liên hệ với email '" + dto.getEmail() + "' đã tồn tại!");
        }
        Contact contact = modelMapper.map(dto, Contact.class);
        contact.setStatus("NEW");
        Contact savedContact = contactRepo.save(contact);
        return modelMapper.map(savedContact, ContactDTO.class);
    }

    @Override
    public ContactResponse getAllContacts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Contact> contactPage = contactRepo.findAll(pageable);
        if (contactPage.getContent().isEmpty()) {
            throw new APIException("Không có liên hệ nào được tạo!");
        }
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
    public ContactDTO getContactById(Long id) {
        Contact contact = contactRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        return modelMapper.map(contact, ContactDTO.class);
    }

    @Override
    public String deleteContact(Long id) {
        Contact contact = contactRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        contactRepo.delete(contact);
        return "Contact with id: " + id + " deleted successfully!";
    }

    @Override
    public ContactDTO updateContact(Long id, ContactDTO dto) {
        Contact contact = contactRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
        contact.setName(dto.getName());
        contact.setEmail(dto.getEmail());
        contact.setMessage(dto.getMessage());
        contact.setStatus(dto.getStatus());
        Contact updatedContact = contactRepo.save(contact);
        return modelMapper.map(updatedContact, ContactDTO.class);
    }
}