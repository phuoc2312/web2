package com.maihuuphuoc.example05.service;

import com.maihuuphuoc.example05.payloads.ConfigDTO;

public interface ConfigService {
    ConfigDTO createConfig(ConfigDTO configDTO);
    ConfigDTO getConfigByKey(String key);
    ConfigDTO updateConfig(Long id, ConfigDTO configDTO);
    void deleteConfig(Long id);
}