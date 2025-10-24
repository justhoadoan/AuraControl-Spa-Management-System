package com.example.auracontrol.shared.security;


import com.example.auracontrol.user.UserReposistory;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserReposistory userReposistory;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userReposistory.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
    }
}
