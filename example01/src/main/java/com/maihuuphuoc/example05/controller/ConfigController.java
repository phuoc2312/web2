package com.maihuuphuoc.example05.controller;

import com.maihuuphuoc.example05.payloads.ConfigDTO;
import com.maihuuphuoc.example05.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class ConfigController {
    @Autowired
    private ConfigService configService;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<ConfigDTO> createConfig(@RequestBody ConfigDTO configDTO) {
        return ResponseEntity.ok(configService.createConfig(configDTO));
    }

    @GetMapping("/{key}")
    public ResponseEntity<ConfigDTO> getConfigByKey(@PathVariable String key) {
        return ResponseEntity.ok(configService.getConfigByKey(key));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ConfigDTO> updateConfig(@PathVariable Long id, @RequestBody ConfigDTO configDTO) {
        return ResponseEntity.ok(configService.updateConfig(id, configDTO));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id) {
        configService.deleteConfig(id);
        return ResponseEntity.noContent().build();
    }
}