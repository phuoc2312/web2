package com.maihuuphuoc.example05.service.impl;

import com.maihuuphuoc.example05.entity.Config;
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
        configRepo.count();
    }

    @Override
    public ConfigDTO createConfig(ConfigDTO configDTO) {
        Config config = modelMapper.map(configDTO, Config.class);
        Config savedConfig = configRepo.save(config);
        return modelMapper.map(savedConfig, ConfigDTO.class);
    }

    @Override
    public ConfigDTO getConfigById(Long id) {
        Config config = configRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config", "id", id));
        return modelMapper.map(config, ConfigDTO.class);
    }

    @Override
    public ConfigDTO updateConfig(Long id, ConfigDTO configDTO) {
        Config config = configRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config", "id", id));
        config.setSiteName(configDTO.getSiteName());
        config.setEmail(configDTO.getEmail());
        config.setPhone(configDTO.getPhone());
        config.setAddress(configDTO.getAddress());
        config.setHotline(configDTO.getHotline());
        Config updatedConfig = configRepo.save(config);
        return modelMapper.map(updatedConfig, ConfigDTO.class);
    }

    @Override
    public String deleteConfig(Long id) {
        Config config = configRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Config", "id", id));
        configRepo.delete(config);
        return "Config with id: " + id + " deleted successfully!";
    }
}