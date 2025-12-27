package com.example.auracontrol.admin.service;

import com.example.auracontrol.admin.dto.CustomerDetailResponse;
import com.example.auracontrol.admin.dto.CustomerListResponse;
import com.example.auracontrol.booking.entity.Appointment;
import com.example.auracontrol.booking.repository.AppointmentRepository;
import com.example.auracontrol.exception.ResourceNotFoundException;
import com.example.auracontrol.user.entity.Customer;
import com.example.auracontrol.user.entity.User;
import com.example.auracontrol.user.repository.CustomerRepository;
import com.example.auracontrol.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AppointmentRepository appointmentRepository;

    public Page<CustomerListResponse> getCustomers(String keyword, Pageable pageable) {
        Page<User> usersPage = userRepository.searchCustomers(keyword, pageable);

        return usersPage.map(user -> {
            CustomerListResponse res = new CustomerListResponse();
            res.setUserId(user.getUserId());
            res.setName(user.getName());
            res.setEmail(user.getEmail());

            Optional<Customer> customerOpt = customerRepository.findByUser_UserId(user.getUserId());

            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();

                res.setCustomerId(customer.getCustomerId());


                long count = appointmentRepository.countByCustomer_CustomerId(customer.getCustomerId());
                res.setTotalAppointments(count);
            } else {

                res.setCustomerId(null);
                res.setTotalAppointments(0);
            }

            return res;
        });
    }
    @Transactional(readOnly = true)
    public CustomerDetailResponse getCustomerDetail(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Current account does not exist"));

        CustomerDetailResponse res = new CustomerDetailResponse();
        res.setUserId(user.getUserId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());

        Optional<Customer> customerOpt = Optional.ofNullable(customerRepository.findByUser_UserId(userId).orElseThrow(() -> new ResourceNotFoundException("This user is not customer")));

        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            res.setCustomerId(customer.getCustomerId());

            List<Appointment> appointments = appointmentRepository.findByCustomer_CustomerIdOrderByStartTimeDesc(customer.getCustomerId());

            List<CustomerDetailResponse.AppointmentHistoryDto> history = appointments.stream().map(appt -> {
                CustomerDetailResponse.AppointmentHistoryDto dto = new CustomerDetailResponse.AppointmentHistoryDto();
                dto.setAppointmentId(appt.getAppointmentId());
                dto.setStartTime(appt.getStartTime());
                dto.setEndTime(appt.getEndTime());
                dto.setStatus(appt.getStatus());
                dto.setPrice(appt.getFinalPrice());

                if (appt.getService() != null) {
                    dto.setServiceName(appt.getService().getName());
                }

                if (appt.getTechnician() != null && appt.getTechnician().getUser() != null) {
                    dto.setTechnicianName(appt.getTechnician().getUser().getName());
                } else {
                    dto.setTechnicianName("Undefined");
                }

                return dto;
            }).collect(Collectors.toList());

            res.setAppointmentHistory(history);
        } else {

            res.setCustomerId(null);
            res.setAppointmentHistory(List.of());
        }

        return res;
    }
}
