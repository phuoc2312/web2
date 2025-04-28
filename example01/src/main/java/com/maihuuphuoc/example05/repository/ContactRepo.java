package com.maihuuphuoc.example05.repository;

import com.maihuuphuoc.example05.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContactRepo extends JpaRepository<Contact, Long> {
    Page<Contact> findAll(Pageable pageable);
}