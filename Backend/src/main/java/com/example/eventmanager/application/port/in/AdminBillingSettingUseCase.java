package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.BillingSettingDTO;

public interface AdminBillingSettingUseCase {
    BillingSettingDTO getBillingSetting();
    BillingSettingDTO updateBillingSetting(BillingSettingDTO dto);
}
