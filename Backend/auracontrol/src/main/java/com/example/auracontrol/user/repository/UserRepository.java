package com.example.auracontrol.user.repository;

import com.example.auracontrol.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    @Query("SELECT u FROM User u WHERE u.userId = :id")
    Optional<User> findById(@Param("id") Integer id);

    @Modifying
    @Query("UPDATE User u SET u.name = :name WHERE u.userId = :id")
    void updateProfile(
            @Param("id") Integer id,
            @Param("name") String name
    );

    @Modifying
    @Query("UPDATE User u SET u.password = :newPassword WHERE u.userId = :id")
    void updatePassword(@Param("id") Integer id, @Param("newPassword") String newPassword);

    @Modifying
    @Query("DELETE FROM User u WHERE u.userId = :id")
    void deleteById(@Param("id") Integer id);

    Optional<User> findByVerificationToken(String token);
    @Query("SELECT u FROM User u WHERE u.resetPasswordToken = :token")
    Optional<User> findByResetPasswordToken(@Param("token") String token);

    @Query("SELECT u FROM User u WHERE u.role = 'CUSTOMER' " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchCustomers(@Param("keyword") String keyword, Pageable pageable);

}
