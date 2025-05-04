package com.maihuuphuoc.example05.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.maihuuphuoc.example05.service.impl.UserDetailsServiceImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        String normalizedUri = uri.startsWith(contextPath) ? uri.substring(contextPath.length()) : uri;
        normalizedUri = normalizedUri.startsWith("/") ? normalizedUri : "/" + normalizedUri;

        System.out.println("Processing request URI: " + uri);
        System.out.println("Context path: " + contextPath);
        System.out.println("Normalized URI: " + normalizedUri);

        // Bỏ qua tất cả endpoint /api/public/**, kể cả với context path
        if (normalizedUri.matches("/api/public/.*")) {
            System.out.println("Bypassing JWTFilter for public endpoint: " + uri);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && !authHeader.isBlank() && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);

            if (jwt.isBlank()) {
                System.out.println("Invalid JWT token in Bearer Header for URI: " + uri);
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid JWT token in Bearer Header");
                return;
            }

            try {
                String email = jwtUtil.validateTokenAndRetrieveSubject(jwt);
                UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    System.out.println("Authenticated user: " + email + " for URI: " + uri);
                }
            } catch (JWTVerificationException e) {
                System.out.println("JWT verification failed for URI: " + uri + ", Error: " + e.getMessage());
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid JWT Token");
                return;
            }
        } else {
            System.out.println("No Bearer token found for URI: " + uri);
        }

        filterChain.doFilter(request, response);
    }
}