package com.maihuuphuoc.example05.controller;

import com.maihuuphuoc.example05.payloads.ConfigDTO;
import com.maihuuphuoc.example05.service.ConfigService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
@CrossOrigin(origins = "*")
public class ConfigController {

    @Autowired
    private ConfigService configService;

    @PostMapping("/admin/config")
    public ResponseEntity<ConfigDTO> createConfig(@RequestBody ConfigDTO configDTO) {
        ConfigDTO savedConfigDTO = configService.createConfig(configDTO);
        return new ResponseEntity<>(savedConfigDTO, HttpStatus.CREATED);
    }

    @GetMapping("/public/config/{id}")
    public ResponseEntity<ConfigDTO> getConfigById(@PathVariable Long id) {
        ConfigDTO configDTO = configService.getConfigById(id);
        return new ResponseEntity<>(configDTO, HttpStatus.OK);
    }

    @GetMapping("/public/configs")
    public ResponseEntity<Page<ConfigDTO>> getAllConfigs(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortOrder) {
        Sort sort = Sort.by(sortOrder.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC, sortBy);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<ConfigDTO> configs = configService.getAllConfigs(pageable);
        return new ResponseEntity<>(configs, HttpStatus.OK);
    }

    @PutMapping("/admin/config/{id}")
    public ResponseEntity<ConfigDTO> updateConfig(@PathVariable Long id, @RequestBody ConfigDTO configDTO) {
        ConfigDTO updatedConfigDTO = configService.updateConfig(id, configDTO);
        return new ResponseEntity<>(updatedConfigDTO, HttpStatus.OK);
    }

    @DeleteMapping("/admin/config/{id}")
    public ResponseEntity<String> deleteConfig(@PathVariable Long id) {
        String status = configService.deleteConfig(id);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}