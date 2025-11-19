package com.example.auracontrol.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN TRUE ELSE FALSE END FROM User u WHERE u.email = :email")
    boolean existsByEmail(@Param("email") String email);

    @Override
    @Query("SELECT u FROM User u WHERE u.user_id = :id")
    Optional<User> findById(@Param("id") Integer id);

    @Modifying
    @Query("UPDATE User u SET u.name = :name WHERE u.user_id = :id")
    void updateProfile(
            @Param("id") Integer id,
            @Param("name") String name
    );

    @Modifying
    @Query("UPDATE User u SET u.password = :newPassword WHERE u.user_id = :id")
    void updatePassword(@Param("id") Integer id, @Param("newPassword") String newPassword);

    @Modifying
    @Query("DELETE FROM User u WHERE u.user_id = :id")
    void deleteById(@Param("id") Integer id);
}
