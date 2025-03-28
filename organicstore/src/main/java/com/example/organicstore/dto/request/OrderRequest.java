package com.example.organicstore.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {
    @NotBlank
    private String paymentMethod;

    @NotNull
    @Valid
    private ShippingAddressRequest shippingAddress;
    private String notes;
    private String getPaymentMethod;

}