package com.maihuuphuoc.example05.payloads;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BlogDTO {
    private Long id;
    private String title;
    private String content;
    private String image;
    private Long authorId;
    private String authorEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}