import { apiRequest } from '@/services';
import * as env from '@/config/env';

export const getTours = async ({ commit }, payload = {}) => {
  const additionalData = {
    isProjectTour: {
      tourModalTitle: "have_brief_tour_project",
      tourModalMessage: "look_how_to_create_project"
    },
    isTaskTour: {
      tourModalTitle: "have_brief_task",
      tourModalMessage: "look_how_to_create_task"
    },
    isProjectAndNavbarTour: {
      tourModalTitle: "have_brief_tour_alianhub",
      tourModalMessage: "look_how_to_create"
    },
    isProjectViewTour: {
      tourModalTitle: "have_brief_tour_alianhub_view",
      tourModalMessage: "look_how_to_create"
    },
    isProjectLeftViewTour: {
      tourModalTitle: "have_brief_tour_alianhub_left_side",
      tourModalMessage: "look_how_to_create"
    }
  };

  try {
    const response = await apiRequest("get", env.TOURS);

    if (response.status !== 200) {
      console.error(response?.response?.data?.message);
      return;
    }

    const tourList = response.data;
    if (!Array.isArray(tourList) || tourList.length === 0) return;

    const enrichedTours = tourList.map((tour) => {
      const id = tour.id;

      // Attach completion status if available
      if (Object.prototype.hasOwnProperty.call(payload, id)) {
        tour.isCompleted = payload[id];
      }

      // Attach additional tour modal data
      if (additionalData[id]) {
        Object.assign(tour, additionalData[id]);
      }

      return tour;
    });

    commit('mutateTours', enrichedTours);
  } catch (error) {
    console.error("Error GET TOURS", error);
  }
};
