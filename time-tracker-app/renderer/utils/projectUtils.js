import { fetchProject } from '../controller/project/project';
import { setAllProjects, setFilteredProjects, setLoading, setError } from '../store/projectSlice';

export const filterProjectsForTimeTracking = (projects) => {
  return projects
    .filter((x) => {
      let index = x.apps.findIndex((z) => z.key === 'TimeTracking');
      return index !== -1 && x.apps[index].appStatus || x.apps.includes('TimeTracking');
    })
    .map((itm) => ({ label: itm.ProjectName, value: itm._id, ...itm }));
};

export const fetchAndProcessProjects = async (dispatch, forceFetch = false) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const projects = await fetchProject();
    
    if (projects && projects.length > 0) {
      // Store all projects in the store
      dispatch(setAllProjects(projects));
      
      // Filter and store filtered projects
      const filteredProjects = filterProjectsForTimeTracking(projects);
      dispatch(setFilteredProjects(filteredProjects));
      
      return filteredProjects;
    } else {
      dispatch(setAllProjects([]));
      dispatch(setFilteredProjects([]));
      return [];
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    dispatch(setError(error.message));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
}; 