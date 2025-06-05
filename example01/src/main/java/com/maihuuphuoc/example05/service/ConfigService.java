package com.maihuuphuoc.example05.service;

import com.maihuuphuoc.example05.payloads.ConfigDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ConfigService {
    ConfigDTO createConfig(ConfigDTO configDTO);
    ConfigDTO getConfigById(Long id);
    ConfigDTO updateConfig(Long id, ConfigDTO configDTO);
    String deleteConfig(Long id);
    Page<ConfigDTO> getAllConfigs(Pageable pageable);
}