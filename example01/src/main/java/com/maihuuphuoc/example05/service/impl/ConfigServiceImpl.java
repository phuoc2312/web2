package com.maihuuphuoc.example05.service.impl;

import com.maihuuphuoc.example05.entity.Config;
import com.maihuuphuoc.example05.exceptions.APIException;
import com.maihuuphuoc.example05.exceptions.ResourceNotFoundException;
import com.maihuuphuoc.example05.payloads.ConfigDTO;
import com.maihuuphuoc.example05.repository.ConfigRepo;
import com.maihuuphuoc.example05.service.ConfigService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class ConfigServiceImpl implements ConfigService {
    @Autowired
    private ConfigRepo configRepo;

    @Autowired
    private ModelMapper modelMapper;

    @PostConstruct
    public void init() {
        // Truy vấn thử để ép Hibernate tải entity Config
        configRepo.count();
    }

    @Override
    public ConfigDTO createConfig(ConfigDTO configDTO) {
        Config config = modelMapper.map(configDTO, Config.class);
        if (configRepo.findByKey(config.getKey()) != null) {
            throw new APIException("Config with key " + config.getKey() + " already exists");
        }
        Config savedConfig = configRepo.save(config);
        return modelMapper.map(savedConfig, ConfigDTO.class);
    }

    @Override
    public ConfigDTO getConfigByKey(String key) {
        Config config = configRepo.findByKey(key);
        if (config == null) {
            throw new ResourceNotFoundException("Config", "key", key);
        }
        return modelMapper.map(config, ConfigDTO.class);
    }

    @Override
    public ConfigDTO updateConfig(Long id, ConfigDTO configDTO) {
        Config config = configRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config", "id", id));
        config.setKey(configDTO.getKey());
        config.setValue(configDTO.getValue());
        config.setDescription(configDTO.getDescription());
        Config updatedConfig = configRepo.save(config);
        return modelMapper.map(updatedConfig, ConfigDTO.class);
    }

    @Override
    public void deleteConfig(Long id) {
        Config config = configRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config", "id", id));
        configRepo.delete(config);
    }
}