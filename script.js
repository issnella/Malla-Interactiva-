fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const nodes = data.courses.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status || 'pendiente'
    }));
    const links = data.courses.flatMap(c =>
      c.prereqs.map(pr => ({ source: pr, target: c.id }))
    );

    const width = window.innerWidth;
    const height = window.innerHeight * 0.85;

    const svg = d3.select("#vis")
      .attr("width", width)
      .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(130))
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link");

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("rect")
      .attr("width", 150)
      .attr("height", 40)
      .attr("x", -75)
      .attr("y", -20)
      .attr("rx", 8)
      .attr("ry", 8);

    node.append("text")
      .attr("x", -65)
      .attr("y", 0)
      .attr("alignment-baseline", "middle")
      .text(d => d.id);

    node.append("text")
      .attr("class", "status-icon")
      .attr("x", 65)
      .attr("y", 0)
      .attr("alignment-baseline", "middle")
      .text(d => {
        switch (d.status) {
          case "aprobado": return "✅";
          case "bloqueado": return "🔒";
          case "pendiente": return "⏳";
          default: return "";
        }
      });

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  })
  .catch(err => console.error("Error cargando data.json:", err));
