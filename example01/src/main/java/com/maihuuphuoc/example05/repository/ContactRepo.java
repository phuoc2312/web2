package com.maihuuphuoc.example05.repository;

import com.maihuuphuoc.example05.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ContactRepo extends JpaRepository<Contact, Long> {
    Optional<Contact> findByEmail(String email);
}