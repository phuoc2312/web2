package com.maihuuphuoc.example05.payloads;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ConfigDTO {
    private Long id;
    private String siteName;
    private String email;
    private String phone;
    private String address;
    private String hotline;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}