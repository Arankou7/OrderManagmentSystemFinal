package com.example.thesis.cart_service.repository;

import com.example.thesis.cart_service.model.Cart;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends CrudRepository<Cart, String> {

}