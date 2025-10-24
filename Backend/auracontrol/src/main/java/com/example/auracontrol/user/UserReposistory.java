package com.example.auracontrol.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserReposistory extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}
