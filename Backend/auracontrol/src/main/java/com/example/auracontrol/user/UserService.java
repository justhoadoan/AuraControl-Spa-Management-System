package com.example.auracontrol.user;


import com.example.auracontrol.exception.InvalidRequestException;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.user.dto.ChangePasswordRequest;
import com.example.auracontrol.user.dto.UpdateProfileRequest;
import com.example.auracontrol.user.dto.UpdateProfileResponseWrapper;
import com.example.auracontrol.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getCurrentUserProfile() {

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot find User"));

        return UserProfileResponse.builder()
                .id(Math.toIntExact(user.getUser_id()))
                .fullName(user.getName())
                .email(user.getEmail())
                .build();
    }
    @Transactional
    public UpdateProfileResponseWrapper updateCurrentUserProfile(UpdateProfileRequest request) {

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();


        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        String newName = request.getFullName() != null ? request.getFullName() : currentUser.getName();


        userRepository.updateProfile(Math.toIntExact(currentUser.getUser_id()), newName);


        UserProfileResponse updatedUserDto = UserProfileResponse.builder()
                .id(Math.toIntExact(currentUser.getUser_id()))
                .fullName(newName)
                .email(currentUser.getEmail())
                .build();

        return new UpdateProfileResponseWrapper("Profile updated successfully", updatedUserDto);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));


        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidRequestException("Old password is not correct.");
        }


        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());


        userRepository.updatePassword(Math.toIntExact(user.getUser_id()), encodedNewPassword);
    }
}
