package com.college.portal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CollegePortalApplication {

    private static final Logger log = LoggerFactory.getLogger(CollegePortalApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CollegePortalApplication.class, args);
        log.info("College Portal Backend application initialized successfully.");
    }
}
