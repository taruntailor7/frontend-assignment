import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import './App.css';

const App = () => {
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageInput, setPageInput] = useState('');

  const recordsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://raw.githubusercontent.com/saaslabsco/frontend-assignment/refs/heads/master/frontend-assignment.json'
      );
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput('');
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      handlePageChange(pageNumber);
    }
  };

  const paginatedData = projects?.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(projects?.length / recordsPerPage);

  return (
    <div className="App">
      <h1>Projects</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="custom-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Percentage Funded</th>
                <th>Amount Pledged</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData?.map((project, index) => (
                <tr key={index}>
                  <td>{index + 1 + (currentPage - 1) * recordsPerPage}</td>
                  <td>{project['percentage.funded']}%</td>
                  <td>${project['amt.pledged'].toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-info">
            <p>
              Showing {paginatedData?.length} of {projects?.length} records &nbsp;|&nbsp;
              Page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="pagination">
            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
              <ChevronsLeft size={20} />
            </button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft size={20} />
            </button>
            <button className="active">{currentPage}</button>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight size={20} />
            </button>
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
              <ChevronsRight size={20} />
            </button>
          </div>
          <form onSubmit={handlePageInputSubmit} className="page-input-form">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={handlePageInputChange}
              placeholder="Enter page number"
            />
            <button type="submit">
              <Search size={16} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default App;
