package com.maihuuphuoc.example05.repository;

import com.maihuuphuoc.example05.entity.Config;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfigRepo extends JpaRepository<Config, Long> {
    Config findByKey(String key);
}