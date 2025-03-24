package com.example.organicstore;


import com.example.organicstore.model.ERole;
import com.example.organicstore.model.Role;
import com.example.organicstore.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class OrganicStoreApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrganicStoreApiApplication.class, args);
    }
    
    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            // Initialize roles if they don't exist
            if (roleRepository.count() == 0) {
                roleRepository.save(new Role(ERole.ROLE_USER));
                roleRepository.save(new Role(ERole.ROLE_ADMIN));
                System.out.println("Roles initialized successfully");
            }
        };
    }
}