package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.mapper.GuestMapper;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import com.example.eventmanager.domain.model.Guest;
import com.example.eventmanager.infrastructure.persistence.entity.GuestEntity;
import com.example.eventmanager.infrastructure.persistence.repository.JpaGuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class GuestRepositoryAdapter implements GuestRepositoryPort {

    private final JpaGuestRepository jpaGuestRepository;
    private final GuestMapper guestMapper;

    @Override
    public Guest save(Guest guest) {
        GuestEntity entity = guestMapper.toEntity(guest);
        GuestEntity saved = jpaGuestRepository.save(entity);
        return guestMapper.toDomainFromEntity(saved);
    }

    @Override
    public Optional<Guest> findById(Long id) {
        return jpaGuestRepository.findById(id)
                .map(guestMapper::toDomainFromEntity);
    }

    @Override
    public List<Guest> findByEventId(Long eventId) {
        return jpaGuestRepository.findByEventId(eventId).stream()
                .map(guestMapper::toDomainFromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaGuestRepository.deleteById(id);
    }

    @Override
    public void deleteByEventId(Long eventId) {
        jpaGuestRepository.deleteByEventId(eventId);
    }

    @Override
    public long countByEventId(Long eventId) {
        return jpaGuestRepository.countByEventId(eventId);
    }
}
