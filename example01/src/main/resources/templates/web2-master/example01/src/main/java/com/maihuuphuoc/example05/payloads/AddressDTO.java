package com.maihuuphuoc.example05.payloads;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {

    private Long addressId;
    private String street;
    private String buildingName;
    private String city;
    private String state;
    private String country;
    private String pincode;

 // Getters and setters
 public Long getAddressId() { return addressId; }
 public void setAddressId(Long addressId) { this.addressId = addressId; }
 public String getStreet() { return street; }
 public void setStreet(String street) { this.street = street; }
 public String getBuildingName() { return buildingName; }
 public void setBuildingName(String buildingName) { this.buildingName = buildingName; }
 public String getCity() { return city; }
 public void setCity(String city) { this.city = city; }
 public String getState() { return state; }
 public void setState(String state) { this.state = state; }
 public String getCountry() { return country; }
 public void setCountry(String country) { this.country = country; }
 public String getPincode() { return pincode; }
 public void setPincode(String pincode) { this.pincode = pincode; }
}