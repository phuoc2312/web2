package com.maihuuphuoc.example05.service;

import com.maihuuphuoc.example05.payloads.ConfigDTO;

public interface ConfigService {
    ConfigDTO createConfig(ConfigDTO configDTO);
    ConfigDTO getConfigById(Long id);
    ConfigDTO updateConfig(Long id, ConfigDTO configDTO);
    String deleteConfig(Long id);
}