package com.example.auracontrol;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableJpaAuditing
public class AuracontrolApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuracontrolApplication.class, args);

	}

}
