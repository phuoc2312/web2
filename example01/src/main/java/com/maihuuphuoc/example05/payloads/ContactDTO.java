package com.maihuuphuoc.example05.payloads;

import lombok.Data;

@Data
public class ContactDTO {
    private Long contactId;
    private String name;
    private String email;
    private String message;
    private String status;
}