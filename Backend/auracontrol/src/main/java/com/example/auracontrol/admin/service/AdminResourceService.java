package com.example.auracontrol.admin.service;

import com.example.auracontrol.admin.dto.ResourceDto;
import com.example.auracontrol.booking.entity.Resource;
import com.example.auracontrol.booking.repository.ResourceRepository;
import com.example.auracontrol.exception.DuplicateResourceException;
import com.example.auracontrol.exception.InvalidRequestException;
import com.example.auracontrol.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminResourceService {
    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }


    public List<String> getAllResourceTypes() {
        return resourceRepository.findDistinctTypes();
    }
    public Resource getResourceById(Integer id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    @Transactional
    public Resource createResource(ResourceDto request) {

        if (resourceRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Active resource with name '" + request.getName() + "' already exists.");
        }

        Resource resource = new Resource();
        resource.setName(request.getName());

        resource.setType(request.getType());

        resource.setDeleted(false);

        return resourceRepository.save(resource);
    }



    @Transactional
    public Resource updateResource(Integer id, ResourceDto request) {
        Resource resource = getResourceById(id);

        // Check trùng tên Resource (khi đổi tên)
        if (resourceRepository.existsByNameAndResourceIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Resource name '" + request.getName() + "' already exists.");
        }

        if (!resourceRepository.existsByType(request.getType())) {
            List<String> availableTypes = resourceRepository.findDistinctTypes();
            throw new InvalidRequestException(
                    "Invalid resource type. You can only update to existing types: " + availableTypes
            );
        }

        resource.setName(request.getName());
        resource.setType(request.getType());

        return resourceRepository.save(resource);
    }
    @Transactional
    public void deleteResource(Integer id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }
}
