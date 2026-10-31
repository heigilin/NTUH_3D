// js/data/ipc-movements-data.js - 感管個案動態分布與時間軸轉床歷程資料庫 (CRAB, CRE, VRE, MRSA)
window.IPC_MOVEMENTS_DATA = {
  "timeline_range": {
    "start_date": "2026-10-01",
    "end_date": "2026-10-15",
    "default_date": "2026-10-06"
  },
  "cases": [
    {
      "case_id": "CASE-2026-001",
      "pathogen": "CRAB",
      "sample_date": "2026-10-03",
      "infection_site": "Sputum (痰液)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 8,
        "Foley": 14,
        "Endotracheal": 6
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-06",
          "bed_id": "7D01-1",
          "ward": "7D",
          "room": "7D01",
          "campus": "east"
        },
        {
          "start_date": "2026-10-06",
          "end_date": "2026-10-15",
          "bed_id": "7D22-1",
          "ward": "7D",
          "room": "7D22",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-002",
      "pathogen": "CRAB",
      "sample_date": "2026-10-04",
      "infection_site": "Sputum (痰液)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 5,
        "Foley": 9,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-02",
          "end_date": "2026-10-10",
          "bed_id": "7D01-2",
          "ward": "7D",
          "room": "7D01",
          "campus": "east"
        },
        {
          "start_date": "2026-10-10",
          "end_date": "2026-10-15",
          "bed_id": "7D20-1",
          "ward": "7D",
          "room": "7D20",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-003",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 3,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-05",
          "bed_id": "7D01-3",
          "ward": "7D",
          "room": "7D01",
          "campus": "east"
        },
        {
          "start_date": "2026-10-05",
          "end_date": "2026-10-12",
          "bed_id": "7D07-1",
          "ward": "7D",
          "room": "7D07",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W01",
      "pathogen": "CRE",
      "sample_date": "2026-10-04",
      "infection_site": "Urine (尿液)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 4,
        "Foley": 12,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-07",
          "bed_id": "5W2-01-1",
          "ward": "5W2",
          "room": "5W2-01",
          "campus": "west"
        },
        {
          "start_date": "2026-10-07",
          "end_date": "2026-10-15",
          "bed_id": "5W2-27-1",
          "ward": "5W2",
          "room": "5W2-27",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W02",
      "pathogen": "CRE",
      "sample_date": "2026-10-05",
      "infection_site": "Sputum (痰液)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 6,
        "Foley": 7,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-02",
          "end_date": "2026-10-12",
          "bed_id": "5W2-01-2",
          "ward": "5W2",
          "room": "5W2-01",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W03",
      "pathogen": "VRE",
      "sample_date": "2026-10-03",
      "infection_site": "Wound (傷口分泌物)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 9,
        "Foley": 15,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-14",
          "bed_id": "5W2-13-1",
          "ward": "5W2",
          "room": "5W2-13",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W04",
      "pathogen": "MRSA",
      "sample_date": "2026-10-06",
      "infection_site": "Blood (菌血症)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 11,
        "Foley": 8,
        "Endotracheal": 3
      },
      "movement_history": [
        {
          "start_date": "2026-10-03",
          "end_date": "2026-10-15",
          "bed_id": "5W2-17-2",
          "ward": "5W2",
          "room": "5W2-17",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W05",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-01-3",
          "ward": "5W2",
          "room": "5W2-01",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W06",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-03-1",
          "ward": "5W2",
          "room": "5W2-03",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W07",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-03-2",
          "ward": "5W2",
          "room": "5W2-03",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W08",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-03-3",
          "ward": "5W2",
          "room": "5W2-03",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W09",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-07-1",
          "ward": "5W2",
          "room": "5W2-07",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W10",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-09-1",
          "ward": "5W2",
          "room": "5W2-09",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W11",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-11-2",
          "ward": "5W2",
          "room": "5W2-11",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W12",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-13-3",
          "ward": "5W2",
          "room": "5W2-13",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W13",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-15-1",
          "ward": "5W2",
          "room": "5W2-15",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W14",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-15-2",
          "ward": "5W2",
          "room": "5W2-15",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W15",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-15-3",
          "ward": "5W2",
          "room": "5W2-15",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W16",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-17-3",
          "ward": "5W2",
          "room": "5W2-17",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W17",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-19-1",
          "ward": "5W2",
          "room": "5W2-19",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W18",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-21-1",
          "ward": "5W2",
          "room": "5W2-21",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W19",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-23-2",
          "ward": "5W2",
          "room": "5W2-23",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W20",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-25-2",
          "ward": "5W2",
          "room": "5W2-25",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W21",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-29-1",
          "ward": "5W2",
          "room": "5W2-29",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W22",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-29-2",
          "ward": "5W2",
          "room": "5W2-29",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W23",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-29-3",
          "ward": "5W2",
          "room": "5W2-29",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W24",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-31-1",
          "ward": "5W2",
          "room": "5W2-31",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-W25",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "5W2-31-2",
          "ward": "5W2",
          "room": "5W2-31",
          "campus": "west"
        }
      ]
    },
    {
      "case_id": "CASE-2026-004",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A06-1",
          "ward": "7A",
          "room": "7A06",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-005",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A07-1",
          "ward": "7A",
          "room": "7A07",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-006",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A08-1",
          "ward": "7A",
          "room": "7A08",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-007",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A09-1",
          "ward": "7A",
          "room": "7A09",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-008",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A09-2",
          "ward": "7A",
          "room": "7A09",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-009",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A10-2",
          "ward": "7A",
          "room": "7A10",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-010",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A11-2",
          "ward": "7A",
          "room": "7A11",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-011",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A13-2",
          "ward": "7A",
          "room": "7A13",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-012",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A15-1",
          "ward": "7A",
          "room": "7A15",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-013",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A15-2",
          "ward": "7A",
          "room": "7A15",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-014",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A16-2",
          "ward": "7A",
          "room": "7A16",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-015",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A05-1",
          "ward": "7A",
          "room": "7A05",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-016",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A03-1",
          "ward": "7A",
          "room": "7A03",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-017",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A02-1",
          "ward": "7A",
          "room": "7A02",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-018",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A02-2",
          "ward": "7A",
          "room": "7A02",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-019",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A02-3",
          "ward": "7A",
          "room": "7A02",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-020",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A01-1",
          "ward": "7A",
          "room": "7A01",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-021",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A01-2",
          "ward": "7A",
          "room": "7A01",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-022",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A19-1",
          "ward": "7A",
          "room": "7A19",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-023",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A18-1",
          "ward": "7A",
          "room": "7A18",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-024",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A17-1",
          "ward": "7A",
          "room": "7A17",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-025",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7A20-1",
          "ward": "7A",
          "room": "7A20",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-026",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B03-1",
          "ward": "7B",
          "room": "7B03",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-027",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B02-3",
          "ward": "7B",
          "room": "7B02",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-028",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B01-2",
          "ward": "7B",
          "room": "7B01",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-029",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B06-1",
          "ward": "7B",
          "room": "7B06",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-030",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B07-1",
          "ward": "7B",
          "room": "7B07",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-031",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B07-2",
          "ward": "7B",
          "room": "7B07",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-032",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B08-1",
          "ward": "7B",
          "room": "7B08",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-033",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B08-2",
          "ward": "7B",
          "room": "7B08",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-034",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B09-1",
          "ward": "7B",
          "room": "7B09",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-035",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B09-2",
          "ward": "7B",
          "room": "7B09",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-036",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B10-1",
          "ward": "7B",
          "room": "7B10",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-037",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B10-2",
          "ward": "7B",
          "room": "7B10",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-038",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B12-2",
          "ward": "7B",
          "room": "7B12",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-039",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B13-2",
          "ward": "7B",
          "room": "7B13",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-040",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B15-1",
          "ward": "7B",
          "room": "7B15",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-041",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B15-2",
          "ward": "7B",
          "room": "7B15",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-042",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B16-1",
          "ward": "7B",
          "room": "7B16",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-043",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B16-2",
          "ward": "7B",
          "room": "7B16",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-044",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B17-1",
          "ward": "7B",
          "room": "7B17",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-045",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B18-1",
          "ward": "7B",
          "room": "7B18",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-046",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B21-2",
          "ward": "7B",
          "room": "7B21",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-047",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B21-3",
          "ward": "7B",
          "room": "7B21",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-048",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B20-1",
          "ward": "7B",
          "room": "7B20",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-049",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7B20-2",
          "ward": "7B",
          "room": "7B20",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-050",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C06-1",
          "ward": "7C",
          "room": "7C06",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-051",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C07-1",
          "ward": "7C",
          "room": "7C07",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-052",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C07-2",
          "ward": "7C",
          "room": "7C07",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-053",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C09-1",
          "ward": "7C",
          "room": "7C09",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-054",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C10-2",
          "ward": "7C",
          "room": "7C10",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-055",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C12-1",
          "ward": "7C",
          "room": "7C12",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-056",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C12-2",
          "ward": "7C",
          "room": "7C12",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-057",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C13-2",
          "ward": "7C",
          "room": "7C13",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-058",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C15-1",
          "ward": "7C",
          "room": "7C15",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-059",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C16-1",
          "ward": "7C",
          "room": "7C16",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-060",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C16-2",
          "ward": "7C",
          "room": "7C16",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-061",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C03-1",
          "ward": "7C",
          "room": "7C03",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-062",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C02-2",
          "ward": "7C",
          "room": "7C02",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-063",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C01-1",
          "ward": "7C",
          "room": "7C01",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-064",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C01-3",
          "ward": "7C",
          "room": "7C01",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-065",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C21-1",
          "ward": "7C",
          "room": "7C21",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-066",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C21-3",
          "ward": "7C",
          "room": "7C21",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-067",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C20-3",
          "ward": "7C",
          "room": "7C20",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-068",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7C19-1",
          "ward": "7C",
          "room": "7C19",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-069",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D05-1",
          "ward": "7D",
          "room": "7D05",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-070",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D02-3",
          "ward": "7D",
          "room": "7D02",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-071",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D07-2",
          "ward": "7D",
          "room": "7D07",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-072",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D08-1",
          "ward": "7D",
          "room": "7D08",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-073",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D10-1",
          "ward": "7D",
          "room": "7D10",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-074",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D11-1",
          "ward": "7D",
          "room": "7D11",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-075",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D11-2",
          "ward": "7D",
          "room": "7D11",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-076",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D15-1",
          "ward": "7D",
          "room": "7D15",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-077",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D15-2",
          "ward": "7D",
          "room": "7D15",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-078",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D16-1",
          "ward": "7D",
          "room": "7D16",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-079",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D16-2",
          "ward": "7D",
          "room": "7D16",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-080",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D21-1",
          "ward": "7D",
          "room": "7D21",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-081",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D21-3",
          "ward": "7D",
          "room": "7D21",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-082",
      "pathogen": "NORMAL",
      "sample_date": null,
      "infection_site": "無感染",
      "isolation_type": "常規防護",
      "device_days": {
        "CVC": 0,
        "Foley": 2,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-01",
          "end_date": "2026-10-15",
          "bed_id": "7D20-2",
          "ward": "7D",
          "room": "7D20",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-088",
      "pathogen": "CRAB",
      "sample_date": "2026-10-04",
      "infection_site": "Sputum (痰液)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 7,
        "Foley": 10,
        "Endotracheal": 5
      },
      "movement_history": [
        {
          "start_date": "2026-10-02",
          "end_date": "2026-10-08",
          "bed_id": "12A06-1",
          "ward": "12A",
          "room": "12A06",
          "campus": "east"
        },
        {
          "start_date": "2026-10-08",
          "end_date": "2026-10-18",
          "bed_id": "12D01-1",
          "ward": "12D",
          "room": "12D01",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-089",
      "pathogen": "CRE",
      "sample_date": "2026-10-07",
      "infection_site": "Urine (尿液)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 4,
        "Foley": 12,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-05",
          "end_date": "2026-10-14",
          "bed_id": "12B08-2",
          "ward": "12B",
          "room": "12B08",
          "campus": "east"
        }
      ]
    },
    {
      "case_id": "CASE-2026-090",
      "pathogen": "MRSA",
      "sample_date": "2026-10-05",
      "infection_site": "Wound (傷口分泌物)",
      "isolation_type": "接觸隔離 (Contact Precautions)",
      "device_days": {
        "CVC": 3,
        "Foley": 6,
        "Endotracheal": 0
      },
      "movement_history": [
        {
          "start_date": "2026-10-03",
          "end_date": "2026-10-12",
          "bed_id": "05PW-01-01",
          "ward": "05PW",
          "room": "05PW-01",
          "campus": "children"
        },
        {
          "start_date": "2026-10-12",
          "end_date": "2026-10-22",
          "bed_id": "05PW-03-01",
          "ward": "05PW",
          "room": "05PW-03",
          "campus": "children"
        }
      ]
    },
    {
      "case_id": "CASE-2026-091",
      "pathogen": "VRE",
      "sample_date": "2026-10-10",
      "infection_site": "Stool (糞便)",
      "isolation_type": "負壓隔離 (Isolation Room)",
      "device_days": {
        "CVC": 6,
        "Foley": 8,
        "Endotracheal": 2
      },
      "movement_history": [
        {
          "start_date": "2026-10-08",
          "end_date": "2026-10-20",
          "bed_id": "05PE-02-01",
          "ward": "05PE",
          "room": "05PE-02",
          "campus": "children"
        }
      ]
    }
  ]
};
